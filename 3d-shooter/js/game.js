/**
 * Main Game class for the 3D Shooter
 */
class Game {
    constructor(options = {}) {
        // Game state
        this.score = 0;
        this.level = 1;
        this.gameOver = false;
        this.paused = false;
        this.difficulty = options.difficulty || 'normal';
        
        // Game objects
        this.player = null;
        this.enemies = [];
        this.bullets = [];
        this.enemyBullets = [];
        this.powerUps = [];
        
        // Game timing
        this.clock = new THREE.Clock();
        this.deltaTime = 0;
        this.elapsedTime = 0;
        this.enemySpawnTimer = 0;
        this.bossSpawnTimer = 0;
        this.terrainFeatureTimer = 0;
        
        // Difficulty settings
        this.difficultySettings = {
            easy: {
                enemySpawnRate: 2.0,
                bossSpawnRate: 60,
                enemyHealth: 0.8,
                enemySpeed: 0.8,
                enemyDamage: 0.8
            },
            normal: {
                enemySpawnRate: 1.5,
                bossSpawnRate: 45,
                enemyHealth: 1.0,
                enemySpeed: 1.0,
                enemyDamage: 1.0
            },
            hard: {
                enemySpawnRate: 1.0,
                bossSpawnRate: 30,
                enemyHealth: 1.2,
                enemySpeed: 1.2,
                enemyDamage: 1.2
            }
        };
        
        // Setup
        this.setupThree();
        this.setupLights();
        this.setupUI();
        this.setupEventListeners();
        
        // Initialize game
        this.init();
    }
    
    /**
     * Initialize the game
     */
    init() {
        // Create environment
        this.environment = new Environment(this.scene);
        
        // Create player
        this.createPlayer();
        
        // Start game loop
        this.animate();
    }
    
    /**
     * Setup Three.js scene, camera, and renderer
     */
    setupThree() {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000030); // Deep blue sky
        this.scene.fog = new THREE.Fog(0x000030, 60, 100); // Add fog for depth
        
        // Create camera
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 40, 20);
        this.camera.lookAt(0, 0, -20);
        
        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        document.body.appendChild(this.renderer.domElement);
        
        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
    }
    
    /**
     * Setup lights in the scene
     */
    setupLights() {
        // Hemisphere light (sky/ground gradient light)
        const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
        this.scene.add(hemiLight);
        
        // Directional light (sun)
        const dirLight = new THREE.DirectionalLight(0xffffff, 1);
        dirLight.position.set(5, 10, 7.5);
        dirLight.castShadow = true;
        dirLight.shadow.camera.right = 20;
        dirLight.shadow.camera.left = -20;
        dirLight.shadow.camera.top = 20;
        dirLight.shadow.camera.bottom = -20;
        this.scene.add(dirLight);
        
        // Add some ambient fill light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        this.scene.add(ambientLight);
    }
    
    /**
     * Setup game UI
     */
    setupUI() {
        // Get UI elements
        this.gameUI = document.getElementById('game-ui');
        this.loadingScreen = document.getElementById('loading-screen');
        this.gameOverScreen = document.getElementById('game-over');
        this.startMenu = document.getElementById('start-menu');
        this.finalScoreElement = document.getElementById('final-score');
        this.restartButton = document.getElementById('restart-button');
        this.startButton = document.getElementById('start-button');
        this.difficultyButtons = document.querySelectorAll('.difficulty-btn');
        
        // Create score display
        this.scoreDisplay = document.createElement('div');
        this.scoreDisplay.className = 'score-display';
        this.scoreDisplay.innerHTML = 'Score: 0';
        this.gameUI.appendChild(this.scoreDisplay);
        
        // Create lives display
        this.livesDisplay = document.createElement('div');
        this.livesDisplay.className = 'lives-display';
        this.livesDisplay.innerHTML = 'Lives: 3';
        this.gameUI.appendChild(this.livesDisplay);
        
        // Create level display
        this.levelDisplay = document.createElement('div');
        this.levelDisplay.className = 'level-display';
        this.levelDisplay.innerHTML = 'Level: 1';
        this.gameUI.appendChild(this.levelDisplay);
        
        // Create button container
        this.buttonContainer = document.createElement('div');
        this.buttonContainer.className = 'button-container';
        this.gameUI.appendChild(this.buttonContainer);
        
        // Create bomb button
        this.bombButton = document.createElement('button');
        this.bombButton.className = 'action-button bomb-button';
        this.bombButton.innerHTML = 'BOMB<span class="count-indicator">2</span>';
        this.bombButton.addEventListener('click', () => this.useBomb());
        this.buttonContainer.appendChild(this.bombButton);
        
        // Create barrage button
        this.barrageButton = document.createElement('button');
        this.barrageButton.className = 'action-button barrage-button';
        this.barrageButton.innerHTML = 'BARRAGE<span class="count-indicator">100%</span>';
        this.barrageButton.addEventListener('click', () => this.useBarrage());
        this.buttonContainer.appendChild(this.barrageButton);
        
        // Setup event listeners for UI buttons
        this.restartButton.addEventListener('click', () => this.restartGame());
        this.startButton.addEventListener('click', () => this.startGame());
        
        // Setup difficulty buttons
        this.difficultyButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove selected class from all buttons
                this.difficultyButtons.forEach(btn => btn.classList.remove('selected'));
                
                // Add selected class to clicked button
                button.classList.add('selected');
                
                // Set difficulty
                this.difficulty = button.dataset.difficulty;
            });
        });
        
        // Show start menu
        this.showStartMenu();
    }
    
    /**
     * Setup event listeners for keyboard and mouse
     */
    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (event) => this.onKeyDown(event));
        document.addEventListener('keyup', (event) => this.onKeyUp(event));
        
        // Mouse/touch controls for mobile
        this.renderer.domElement.addEventListener('touchmove', (event) => this.onTouchMove(event));
        this.renderer.domElement.addEventListener('touchstart', (event) => this.onTouchStart(event));
    }
    
    /**
     * Handle window resize
     */
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    /**
     * Handle keydown events
     * @param {KeyboardEvent} event - Keyboard event
     */
    onKeyDown(event) {
        if (this.gameOver || this.paused) return;
        
        switch (event.key) {
            case 'w':
            case 'ArrowUp':
                this.player.controls.moveForward = true;
                break;
            case 's':
            case 'ArrowDown':
                this.player.controls.moveBackward = true;
                break;
            case 'a':
            case 'ArrowLeft':
                this.player.controls.moveLeft = true;
                break;
            case 'd':
            case 'ArrowRight':
                this.player.controls.moveRight = true;
                break;
            case ' ':
                this.useBomb();
                break;
            case 'f':
                this.useBarrage();
                break;
            case 'p':
                this.togglePause();
                break;
        }
    }
    
    /**
     * Handle keyup events
     * @param {KeyboardEvent} event - Keyboard event
     */
    onKeyUp(event) {
        if (this.gameOver) return;
        
        switch (event.key) {
            case 'w':
            case 'ArrowUp':
                this.player.controls.moveForward = false;
                break;
            case 's':
            case 'ArrowDown':
                this.player.controls.moveBackward = false;
                break;
            case 'a':
            case 'ArrowLeft':
                this.player.controls.moveLeft = false;
                break;
            case 'd':
            case 'ArrowRight':
                this.player.controls.moveRight = false;
                break;
        }
    }
    
    /**
     * Handle touch move events
     * @param {TouchEvent} event - Touch event
     */
    onTouchMove(event) {
        if (this.gameOver || this.paused || !this.player) return;
        
        // Get touch position
        const touch = event.touches[0];
        const rect = this.renderer.domElement.getBoundingClientRect();
        const x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
        
        // Move player based on touch position
        const targetX = x * 25;
        const targetZ = -y * 20 + 10;
        
        // Set player position with smoothing
        this.player.position.x = lerp(this.player.position.x, targetX, 0.1);
        this.player.position.z = lerp(this.player.position.z, targetZ, 0.1);
        
        // Prevent default to avoid scrolling
        event.preventDefault();
    }
    
    /**
     * Handle touch start events
     * @param {TouchEvent} event - Touch event
     */
    onTouchStart(event) {
        if (this.gameOver || this.paused) return;
        
        // Check if touch is on the right side of the screen (for firing)
        const touch = event.touches[0];
        const rect = this.renderer.domElement.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        
        if (x > rect.width * 0.7) {
            // Right side - fire barrage
            this.useBarrage();
        } else if (x > rect.width * 0.5) {
            // Middle-right - fire bomb
            this.useBomb();
        }
        
        // Prevent default to avoid scrolling
        event.preventDefault();
    }
    
    /**
     * Create the player
     */
    createPlayer() {
        // Create player
        this.player = new Player(this.scene, {
            position: new THREE.Vector3(0, 0, 10),
            bounds: {
                minX: -25,
                maxX: 25,
                minZ: -20,
                maxZ: 20
            }
        });
        
        // Set player callbacks
        this.player.onFireBullet = (position, direction, type) => {
            this.createBullet(position, direction, type, true);
        };
        
        this.player.onFireBomb = () => {
            this.fireBomb();
        };
        
        this.player.onUpdateUI = () => {
            this.updateUI();
        };
        
        this.player.onCameraShake = (intensity) => {
            shakeCamera(this.camera, intensity);
        };
    }
    
    /**
     * Create an enemy
     * @param {string} type - Enemy type ('small', 'medium', 'large', 'boss')
     * @param {THREE.Vector3} position - Spawn position
     */
    createEnemy(type, position) {
        // Get difficulty settings
        const settings = this.difficultySettings[this.difficulty];
        
        // Create enemy
        const enemy = new Enemy(this.scene, {
            enemyType: type,
            position: position || new THREE.Vector3(
                (Math.random() - 0.5) * 50,
                0,
                -50
            ),
            targetPosition: this.player.position
        });
        
        // Apply difficulty settings
        enemy.health *= settings.enemyHealth;
        enemy.speed *= settings.enemySpeed;
        enemy.damage *= settings.enemyDamage;
        
        // Set enemy callbacks
        enemy.onFireBullet = (position, direction, type) => {
            this.createBullet(position, direction, type, false);
        };
        
        enemy.onDropPowerUp = (position, type) => {
            this.createPowerUp(position, type);
        };
        
        // Add to enemies array
        this.enemies.push(enemy);
        
        return enemy;
    }
    
    /**
     * Create a bullet
     * @param {THREE.Vector3} position - Spawn position
     * @param {THREE.Vector3} direction - Direction vector
     * @param {string} type - Bullet type ('normal', 'laser', 'missile')
     * @param {boolean} isPlayerBullet - Whether the bullet is from the player
     */
    createBullet(position, direction, type, isPlayerBullet) {
        // Create bullet
        const bullet = new Bullet(this.scene, {
            position: position,
            direction: direction,
            bulletType: type,
            isPlayerBullet: isPlayerBullet
        });
        
        // For player missiles, find a target
        if (isPlayerBullet && type === 'missile' && this.enemies.length > 0) {
            // Find closest enemy
            let closestEnemy = null;
            let closestDistance = Infinity;
            
            for (const enemy of this.enemies) {
                if (!enemy.active) continue;
                
                const distance = enemy.position.distanceTo(position);
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestEnemy = enemy;
                }
            }
            
            // Set target if found
            if (closestEnemy) {
                bullet.target = closestEnemy;
            }
        }
        
        // Add to appropriate array
        if (isPlayerBullet) {
            this.bullets.push(bullet);
        } else {
            this.enemyBullets.push(bullet);
        }
        
        return bullet;
    }
    
    /**
     * Create a power-up
     * @param {THREE.Vector3} position - Spawn position
     * @param {string} type - Power-up type ('weapon', 'bomb', 'life')
     */
    createPowerUp(position, type) {
        // Create power-up
        const powerUp = new PowerUp(this.scene, {
            position: position,
            powerUpType: type
        });
        
        // Add to power-ups array
        this.powerUps.push(powerUp);
        
        return powerUp;
    }
    
    /**
     * Fire a bomb (screen-clearing attack)
     */
    fireBomb() {
        // Create explosion effect
        createExplosion(this.scene, this.player.position, 30, 0xff00ff);
        
        // Create flash effect
        createFlash(this.scene, this.player.position, 50, 0xff00ff, 500);
        
        // Shake camera
        shakeCamera(this.camera, 1.0);
        
        // Destroy all enemies except bosses
        for (const enemy of this.enemies) {
            if (!enemy.active || enemy.isBoss) continue;
            
            // Create explosion at enemy position
            createExplosion(this.scene, enemy.position, 2, 0xff5500);
            
            // Destroy enemy
            enemy.destroy();
            
            // Add score
            this.score += enemy.scoreValue;
        }
        
        // Remove destroyed enemies from array
        this.enemies = this.enemies.filter(enemy => enemy.active);
        
        // Destroy all enemy bullets
        for (const bullet of this.enemyBullets) {
            if (!bullet.active) continue;
            
            // Create small explosion at bullet position
            createExplosion(this.scene, bullet.position, 0.5, 0xff0000);
            
            // Destroy bullet
            bullet.destroy();
        }
        
        // Remove destroyed bullets from array
        this.enemyBullets = this.enemyBullets.filter(bullet => bullet.active);
        
        // Update UI
        this.updateUI();
    }
    
    /**
     * Use a bomb
     */
    useBomb() {
        if (this.gameOver || this.paused || !this.player) return;
        
        this.player.controls.fireBomb = true;
    }
    
    /**
     * Use a barrage
     */
    useBarrage() {
        if (this.gameOver || this.paused || !this.player) return;
        
        this.player.controls.fireBarrage = true;
    }
    
    /**
     * Toggle pause state
     */
    togglePause() {
        this.paused = !this.paused;
        
        if (this.paused) {
            this.clock.stop();
            showMessage('PAUSED', 999999, '#ffffff');
        } else {
            this.clock.start();
            // Remove pause message
            const pauseMessage = document.querySelector('div[style*="position: fixed"]');
            if (pauseMessage) {
                document.body.removeChild(pauseMessage);
            }
        }
    }
    
    /**
     * Show the start menu
     */
    showStartMenu() {
        this.startMenu.classList.remove('hidden');
        this.gameOverScreen.classList.add('hidden');
        this.loadingScreen.classList.add('hidden');
    }
    
    /**
     * Show the game over screen
     */
    showGameOver() {
        this.gameOverScreen.classList.remove('hidden');
        this.finalScoreElement.textContent = this.score;
    }
    
    /**
     * Start the game
     */
    startGame() {
        // Hide start menu
        this.startMenu.classList.add('hidden');
        
        // Reset game state
        this.resetGame();
        
        // Start clock
        this.clock.start();
    }
    
    /**
     * Restart the game
     */
    restartGame() {
        // Hide game over screen
        this.gameOverScreen.classList.add('hidden');
        
        // Reset game state
        this.resetGame();
        
        // Start clock
        this.clock.start();
    }
    
    /**
     * Reset the game state
     */
    resetGame() {
        // Reset game state
        this.score = 0;
        this.level = 1;
        this.gameOver = false;
        this.paused = false;
        this.elapsedTime = 0;
        this.enemySpawnTimer = 0;
        this.bossSpawnTimer = 0;
        
        // Clear game objects
        this.clearGameObjects();
        
        // Create player
        this.createPlayer();
        
        // Update UI
        this.updateUI();
    }
    
    /**
     * Clear all game objects
     */
    clearGameObjects() {
        // Destroy all enemies
        for (const enemy of this.enemies) {
            enemy.destroy();
        }
        this.enemies = [];
        
        // Destroy all bullets
        for (const bullet of this.bullets) {
            bullet.destroy();
        }
        this.bullets = [];
        
        // Destroy all enemy bullets
        for (const bullet of this.enemyBullets) {
            bullet.destroy();
        }
        this.enemyBullets = [];
        
        // Destroy all power-ups
        for (const powerUp of this.powerUps) {
            powerUp.destroy();
        }
        this.powerUps = [];
        
        // Destroy player
        if (this.player) {
            this.player.destroy();
            this.player = null;
        }
    }
    
    /**
     * Update the game UI
     */
    updateUI() {
        if (!this.player) return;
        
        // Update score display
        this.scoreDisplay.innerHTML = `Score: ${this.score}`;
        
        // Update lives display
        this.livesDisplay.innerHTML = `Lives: ${this.player.lives}`;
        
        // Update level display
        this.levelDisplay.innerHTML = `Level: ${this.level}`;
        
        // Update bomb button
        const bombCountIndicator = this.bombButton.querySelector('.count-indicator');
        bombCountIndicator.textContent = this.player.bombCount;
        
        // Update barrage button
        const barrageCountIndicator = this.barrageButton.querySelector('.count-indicator');
        const barragePercent = Math.floor((this.player.barrageEnergy / this.player.maxBarrageEnergy) * 100);
        barrageCountIndicator.textContent = `${barragePercent}%`;
        
        // Disable barrage button if not enough energy
        if (this.player.barrageEnergy < 50) {
            this.barrageButton.disabled = true;
            this.barrageButton.style.opacity = 0.5;
        } else {
            this.barrageButton.disabled = false;
            this.barrageButton.style.opacity = 1.0;
        }
        
        // Disable bomb button if no bombs
        if (this.player.bombCount <= 0) {
            this.bombButton.disabled = true;
            this.bombButton.style.opacity = 0.5;
        } else {
            this.bombButton.disabled = false;
            this.bombButton.style.opacity = 1.0;
        }
    }
    
    /**
     * Spawn enemies based on level and time
     * @param {number} deltaTime - Time since last update in seconds
     */
    spawnEnemies(deltaTime) {
        // Get difficulty settings
        const settings = this.difficultySettings[this.difficulty];
        
        // Update enemy spawn timer
        this.enemySpawnTimer -= deltaTime;
        
        // Check if it's time to spawn enemies
        if (this.enemySpawnTimer <= 0) {
            // Reset timer
            this.enemySpawnTimer = settings.enemySpawnRate * (1 - (this.level - 1) * 0.05);
            
            // Determine enemy type based on level and random chance
            let enemyType;
            const rand = Math.random();
            
            if (this.level <= 2) {
                // Early levels: mostly small enemies
                enemyType = rand < 0.8 ? 'small' : 'medium';
            } else if (this.level <= 5) {
                // Mid levels: mix of small and medium enemies
                enemyType = rand < 0.5 ? 'small' : (rand < 0.9 ? 'medium' : 'large');
            } else {
                // Later levels: mix of all enemy types
                enemyType = rand < 0.4 ? 'small' : (rand < 0.7 ? 'medium' : 'large');
            }
            
            // Spawn enemy
            this.createEnemy(enemyType);
            
            // Spawn additional enemies based on level
            const extraEnemies = Math.floor((this.level - 1) / 2);
            for (let i = 0; i < extraEnemies; i++) {
                if (Math.random() < 0.7) {
                    this.createEnemy('small');
                }
            }
        }
        
        // Update boss spawn timer
        this.bossSpawnTimer -= deltaTime;
        
        // Check if it's time to spawn a boss
        if (this.bossSpawnTimer <= 0 && !this.hasBoss()) {
            // Reset timer
            this.bossSpawnTimer = settings.bossSpawnRate;
            
            // Show boss warning
            showBossWarning();
            
            // Spawn boss after a delay
            setTimeout(() => {
                if (this.gameOver) return;
                
                // Spawn boss
                this.createEnemy('boss', new THREE.Vector3(0, 0, -40));
            }, 3000);
        }
    }
    
    /**
     * Check if there's a boss in the game
     * @returns {boolean} - Whether there's a boss
     */
    hasBoss() {
        return this.enemies.some(enemy => enemy.active && enemy.isBoss);
    }
    
    /**
     * Spawn random terrain features
     * @param {number} deltaTime - Time since last update in seconds
     */
    spawnTerrainFeatures(deltaTime) {
        // Update terrain feature timer
        this.terrainFeatureTimer -= deltaTime;
        
        // Check if it's time to spawn a terrain feature
        if (this.terrainFeatureTimer <= 0) {
            // Reset timer
            this.terrainFeatureTimer = 2 + Math.random() * 3;
            
            // Spawn terrain feature
            this.environment.createRandomTerrainFeature(-25, 25, -60, -40);
        }
    }
    
    /**
     * Update all game objects
     * @param {number} deltaTime - Time since last update in seconds
     */
    update(deltaTime) {
        if (this.gameOver || this.paused) return;
        
        // Update environment
        if (this.environment) {
            this.environment.update(deltaTime);
        }
        
        // Update player
        if (this.player && this.player.active) {
            this.player.update(deltaTime);
        } else if (this.player && !this.player.active) {
            // Player was destroyed
            this.gameOver = true;
            this.showGameOver();
        }
        
        // Update enemies
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            
            if (enemy.active) {
                // Update enemy
                enemy.update(deltaTime);
                
                // Check if enemy is off-screen
                if (enemy.position.z > 30) {
                    enemy.destroy();
                }
            }
        }
        
        // Remove destroyed enemies
        this.enemies = this.enemies.filter(enemy => enemy.active);
        
        // Update bullets
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            
            if (bullet.active) {
                // Update bullet
                bullet.update(deltaTime);
                
                // Check for collisions with enemies
                for (const enemy of this.enemies) {
                    if (bullet.collidesWith(enemy)) {
                        // Handle collision
                        bullet.onCollision(enemy);
                        
                        // Check if enemy was destroyed
                        if (!enemy.active) {
                            // Add score
                            this.score += enemy.scoreValue;
                            
                            // Check if it was a boss
                            if (enemy.isBoss) {
                                // Advance to next level
                                this.level++;
                                showMessage(`LEVEL ${this.level}`, 2000, '#ffff00');
                            }
                            
                            // Update UI
                            this.updateUI();
                        }
                        
                        // Break if bullet was destroyed
                        if (!bullet.active) break;
                    }
                }
            }
        }
        
        // Remove destroyed bullets
        this.bullets = this.bullets.filter(bullet => bullet.active);
        
        // Update enemy bullets
        for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
            const bullet = this.enemyBullets[i];
            
            if (bullet.active) {
                // Update bullet
                bullet.update(deltaTime);
                
                // Check for collision with player
                if (this.player && this.player.active && bullet.collidesWith(this.player)) {
                    // Handle collision
                    bullet.onCollision(this.player);
                }
            }
        }
        
        // Remove destroyed enemy bullets
        this.enemyBullets = this.enemyBullets.filter(bullet => bullet.active);
        
        // Update power-ups
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const powerUp = this.powerUps[i];
            
            if (powerUp.active) {
                // Update power-up
                powerUp.update(deltaTime);
                
                // Check for collision with player
                if (this.player && this.player.active && powerUp.collidesWith(this.player)) {
                    // Handle collection
                    powerUp.onCollected(this.player);
                }
            }
        }
        
        // Remove collected/expired power-ups
        this.powerUps = this.powerUps.filter(powerUp => powerUp.active);
        
        // Spawn enemies
        this.spawnEnemies(deltaTime);
        
        // Spawn terrain features
        this.spawnTerrainFeatures(deltaTime);
    }
    
    /**
     * Animation loop
     */
    animate() {
        // Request next frame
        requestAnimationFrame(() => this.animate());
        
        // Skip if game over or paused
        if (this.gameOver || this.paused) {
            this.renderer.render(this.scene, this.camera);
            return;
        }
        
        // Calculate delta time
        this.deltaTime = this.clock.getDelta();
        this.elapsedTime += this.deltaTime;
        
        // Update game
        this.update(this.deltaTime);
        
        // Render scene
        this.renderer.render(this.scene, this.camera);
    }
}